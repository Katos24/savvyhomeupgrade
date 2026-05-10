'use client';

import Nav from '@/components/marketing/Nav';
import NewHero from '@/components/marketing/NewHero';
import CustomizeFormSection from '@/components/marketing/CustomizeFormSection';
import BuildFormSection from '@/components/marketing/BuildFormSection';
import LeadLandingSection from '@/components/marketing/LeadLandingSection';
import DigestBanner from '@/components/marketing/DigestBanner';
import EfficiencyShowcase from '@/components/marketing/EfficiencyShowcase';
import ValueSection from '@/components/marketing/ValueSection';
import NewWhySection from '@/components/marketing/NewWhySection';
import Pricing from '@/components/marketing/Pricing';
import Comparison from '@/components/marketing/Comparison';
import FinalCTA from '@/components/marketing/FinalCTA';
import Footer from '@/components/marketing/Footer';

/* Smooth gradient transitions between sections */
function DarkFadeIn() {
  return <div className="h-16 sm:h-24 bg-gradient-to-b from-white to-slate-900" />;
}
function DarkToAmber() {
  return <div className="h-16 sm:h-24 bg-gradient-to-b from-slate-900 to-amber-50" />;
}
function AmberToDark() {
  return <div className="h-16 sm:h-24 bg-gradient-to-b from-amber-50 to-slate-900" />;
}
function DarkToWhite() {
  return <div className="h-16 sm:h-24 bg-gradient-to-b from-slate-900 to-white" />;
}
function WhiteToDark() {
  return <div className="h-16 sm:h-24 bg-gradient-to-b from-white to-slate-950" />;
}
function DarkToLight() {
  return <div className="h-16 sm:h-24 bg-gradient-to-b from-slate-950 to-blue-50" />;
}
function LightToDark() {
  return <div className="h-16 sm:h-24 bg-gradient-to-b from-blue-50 to-slate-950" />;
}
function WhiteToDark2() {
  return <div className="h-16 sm:h-24 bg-gradient-to-b from-white to-slate-950" />;
}

export default function NewHome() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-white">
      <Nav />

      {/* 1. HERO — white */}
      <NewHero />

      {/* white → dark */}

            <BuildFormSection />

            <div className="h-16 sm:h-24 bg-gradient-to-b from-white to-slate-900" />



      {/* 2. CUSTOMIZE FORM — dark (slate-900) */}
      <CustomizeFormSection />



      {/* dark → amber */}
      <DarkToAmber />

      {/* 3. LEAD LANDING — amber-50 */}
      <LeadLandingSection />

      {/* amber → dark */}
      <AmberToDark />

      {/* 4. DIGEST BANNER — dark (slate-900) */}
      <DigestBanner />

      {/* dark → white */}
      <DarkToWhite />

      {/* 5. EFFICIENCY SHOWCASE — white */}
      <EfficiencyShowcase />

      {/* white → dark */}
      <WhiteToDark />

      {/* 6. VALUE SECTION — dark (slate-950) */}
      <ValueSection />

      {/* dark → light */}
      <DarkToLight />

      {/* 7. WHY SECTION — light (blue-50) */}
      <NewWhySection />

      {/* light → dark */}
      <LightToDark />

      {/* 8. PRICING — dark (slate-950) */}
      <Pricing />

      {/* dark → white */}
      <DarkToWhite />

      {/* 9. COMPARISON — white */}
      <Comparison />

      {/* white → dark */}
      <WhiteToDark2 />

      {/* 10. FINAL CTA — dark (slate-950) */}
      <FinalCTA />

      {/* 11. FOOTER */}
      <Footer />
    </div>
  );
}