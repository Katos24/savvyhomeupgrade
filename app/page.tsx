// app/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Homepage assembly. Each section is its own component in components/marketing/
// To add/remove a section: comment/uncomment the import and the JSX below.
// ─────────────────────────────────────────────────────────────────────────────

import Nav               from '@/components/marketing/Nav';
import Hero              from '@/components/marketing/Hero';
import ValueStrip        from '@/components/marketing/ValueStrip';
import HowItWorks        from '@/components/marketing/HowItWorks';
import TheBoard          from '@/components/marketing/TheBoard';
import LeadModalSection  from '@/components/marketing/LeadModalSection';
// import AIBanner       from '@/components/marketing/AIBanner';
import SettingsShowcase  from '@/components/marketing/SettingsShowcase';
// import Comparison     from '@/components/marketing/Comparison';
import Pricing           from '@/components/marketing/Pricing';
import FAQ               from '@/components/marketing/FAQ';
import FinalCTA          from '@/components/marketing/FinalCTA';
import Footer            from '@/components/marketing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen font-sans antialiased">
      <Nav />
      <Hero />
      <ValueStrip />
      <HowItWorks />
      <TheBoard />
      <LeadModalSection />
      {/* <AIBanner /> */}
      <SettingsShowcase />
      {/* <Comparison /> */}
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}