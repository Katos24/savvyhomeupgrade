// app/page.tsx
import Nav               from '@/components/marketing/Nav';
import Hero              from '@/components/marketing/Hero';
import ValueStrip        from '@/components/marketing/ValueStrip';
import HowItWorks        from '@/components/marketing/HowItWorks';
import LeadModalSection  from '@/components/marketing/LeadModalSection';
import TheBoard          from '@/components/marketing/TheBoard';
import SettingsShowcase  from '@/components/marketing/SettingsShowcase';
import Pricing           from '@/components/marketing/Pricing';
import Comparison from '@/components/marketing/Comparison';
import FinalCTA          from '@/components/marketing/FinalCTA';
import Footer            from '@/components/marketing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden">
     <Nav />
<Hero />
<HowItWorks />
<ValueStrip />
<LeadModalSection />
<TheBoard />
<SettingsShowcase />
<Pricing />
<Comparison />
<FinalCTA />
<Footer />
    </div>
  );
}