import Nav                from '@/components/marketing/Nav';
import Hero               from '@/components/marketing/Hero';
import LifestyleSection   from '@/components/marketing/LifestyleSection';
import QRMarketingSection from '@/components/marketing/QRMarketingSection';
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

      {/* 2. THE DREAM (White) — Emotional payoff first */}
      <SectionDivider variant="dark-to-white" />
      <LifestyleSection /> 

      {/* 3. THE TOOL (Dark) — How the dream actually works */}
      <SectionDivider variant="white-to-dark" />
      <QRMarketingSection />


      {/* ── WHITE ZONE — LeadModal (The Customer Experience) ── */}
      <LeadModalSection />

      <SectionDivider variant="white-to-dark" />

      {/* ── DARK ZONE 2 — Board + Value (The Efficiency) ── */}
      <TheBoard />
      
      {/* TIP: If the board section feels too long, slot a "Payday Reminder" 
         call-out inside ValueStrip or right after it.
      */}
      <ValueStrip />

      <SectionDivider variant="dark-to-white" darkColor="#0a0f1e" />

      {/* ── WHITE ZONE 2 — Pricing + Comparison ── */}
      <Pricing />

      <SectionDivider variant="white-to-slate" />

      <div className="bg-slate-50">
        <Comparison />
      </div>

      {/* ── DARK ZONE 3 — Closing the Deal ── */}
      <SectionDivider variant="slate-to-white" className="!h-8" />
      <SectionDivider variant="white-to-dark" />
      <FinalCTA />
      <Footer />
    </div>
  );
}