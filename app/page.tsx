import Nav                from '@/components/marketing/Nav';
import Hero               from '@/components/marketing/Hero';
import FeaturesSlider     from '@/components/marketing/FeaturesSlider';
import LeadModalSection   from '@/components/marketing/LeadModalSection';
import TheBoard           from '@/components/marketing/TheBoard';
import ValueStrip         from '@/components/marketing/ValueStrip';
import Pricing            from '@/components/marketing/Pricing';
import Comparison         from '@/components/marketing/Comparison';
import FinalCTA           from '@/components/marketing/FinalCTA';
import Footer             from '@/components/marketing/Footer';
import SectionDivider     from '@/components/marketing/SectionDivider';

export default function Home() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-[#020617]">
      <Nav />

      {/* 1. THE HOOK (Dark) */}
      <Hero />

      {/* 2. THE TECH & LIFESTYLE (Toggles Dark/White) */}
      {/* We remove the divider here because FeaturesSlider handles its own bg transition */}
      <FeaturesSlider />

 
{/* 3. THE CUSTOMER EXPERIENCE (White Zone) */}
<div className="bg-white">
  <LeadModalSection />
</div>

{/* Sharp transition into the "Engine Room" */}
<SectionDivider variant="white-to-dark" />

{/* 4. THE OPERATIONS ENGINE (Dark Zone) */}
<ValueStrip />
<TheBoard />

      <SectionDivider variant="dark-to-white" darkColor="#0a0f1e" />

      {/* 5. CLOSING (White to Slate) */}
      <Pricing />
      <div className="bg-slate-50">
        <Comparison />
      </div>

      <FinalCTA />
      <Footer />
    </div>
  );
}