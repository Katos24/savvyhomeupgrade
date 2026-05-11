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
import HeroDashboardDemo from '@/components/marketing/NewHeroDashboardDemo';

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

<section className="relative bg-white pt-6 sm:pt-10 pb-14 sm:pb-24 overflow-hidden">
  {/* subtle background continuation */}
  <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
    style={{
      backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
      backgroundSize: '26px 26px',
    }}
  />

  <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6">

    {/* Small bridge headline */}
    <div className="text-center mb-6 sm:mb-10">
      <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400">
        From QR Scan to Live Dashboard
      </p>

      <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-3 leading-tight">
        Watch a lead move instantly into your pipeline
      </h2>

      <p className="text-sm sm:text-base text-slate-500 mt-3 max-w-xl mx-auto font-medium">
        No refresh. No delay. No lost leads. Everything updates in real time.
      </p>
    </div>

    {/* Demo */}
    <div className="scale-[0.92] sm:scale-100 origin-top">
      <HeroDashboardDemo />
    </div>

  </div>
</section>
      





      {/* 2. CUSTOMIZE FORM — dark (slate-900) */}
      <CustomizeFormSection />



 

      {/* 3. LEAD LANDING — amber-50 */}
      <LeadLandingSection />

   

      {/* 4. DIGEST BANNER — dark (slate-900) */}
      <DigestBanner />



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